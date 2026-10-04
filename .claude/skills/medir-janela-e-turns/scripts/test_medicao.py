"""Regressões com transcripts sintéticos; não acessa sessões reais do Claude Code."""
import json
import os
from pathlib import Path
import shlex
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("medir-janela.sh")


class MedicaoTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="medicao-test-")
        self.addCleanup(self.temp.cleanup)
        self.config = Path(self.temp.name)
        self.env = os.environ.copy()
        for key in ("TETO", "TETO_TURNS", "PASSO", "PISO", "TAXA_MIN",
                    "RESERVA_TOKENS", "RESERVA_TURNS", "CLAUDE_CODE_SESSION_ID"):
            self.env.pop(key, None)
        self.env["CLAUDE_CONFIG_DIR"] = str(self.config)

    def event(self, turn, tokens):
        return {"type": "assistant", "message": {
            "id": "msg-%d" % turn,
            "usage": {"input_tokens": tokens - 20,
                      "cache_read_input_tokens": 10,
                      "cache_creation_input_tokens": 10}}}

    def transcript(self, name="agente-run-x", session="sessao-a", agent="a",
                   windows=(1000,), events=None):
        folder = self.config / "projects" / "projeto" / session / "subagents"
        folder.mkdir(parents=True, exist_ok=True)
        path = folder / (agent + ".jsonl")
        (folder / (agent + ".meta.json")).write_text(
            json.dumps({"description": name}), encoding="utf-8")
        events = events if events is not None else [self.event(i, n) for i, n in enumerate(windows)]
        path.write_text("".join(json.dumps(e) + "\n" for e in events), encoding="utf-8")
        return path

    def run_script(self, *args, **env):
        return subprocess.run(["bash", str(SCRIPT), *args], env={**self.env, **env},
                              text=True, capture_output=True, check=False)

    def fields(self, result):
        self.assertEqual(result.returncode, 0, result.stderr)
        return dict(part.split("=", 1) for part in shlex.split(result.stdout))

    def test_exact_identity_does_not_select_newer_descendant(self):
        self.transcript(windows=(1200,))
        self.transcript(name="agente-run-x-y", agent="b", windows=(139000,))
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual(result["janela"], "1200")
        self.assertEqual(result["status"], "ok")
        self.assertNotEqual(self.run_script("agente-run").returncode, 0)
        self.assertNotEqual(self.run_script("AGENTE-RUN-X").returncode, 0)

    def test_ambiguous_identity_never_chooses_by_mtime(self):
        self.transcript()
        self.transcript(session="sessao-b")
        self.assertNotEqual(self.run_script("agente-run-x").returncode, 0)
        result = self.fields(self.run_script("agente-run-x", CLAUDE_CODE_SESSION_ID="sessao-a"))
        self.assertEqual(result["fonte"], "exato")

    def test_session_has_no_cross_session_fallback(self):
        self.transcript()
        self.assertNotEqual(self.run_script("agente-run-x", CLAUDE_CODE_SESSION_ID="outra").returncode, 0)

    def test_explicit_path_still_respects_session_boundary(self):
        path = self.transcript()
        self.assertEqual(self.run_script("--transcript", str(path), CLAUDE_CODE_SESSION_ID="sessao-a").returncode, 0)
        self.assertNotEqual(self.run_script("--transcript", str(path), CLAUDE_CODE_SESSION_ID="sessao-b").returncode, 0)

    def test_self_is_not_a_concurrent_agent_guess(self):
        self.transcript()
        self.assertNotEqual(self.run_script("--self").returncode, 0)

    def test_explicit_transcript_and_main(self):
        path = self.transcript(windows=(5000,))
        self.assertEqual(self.fields(self.run_script("--transcript", str(path)))["janela"], "5000")
        main = path.parent.parent.with_suffix(".jsonl")
        main.write_text(path.read_text(), encoding="utf-8")
        result = self.fields(self.run_script("--main", CLAUDE_CODE_SESSION_ID="sessao-a"))
        self.assertEqual(result["fonte"], "main")
        self.assertNotEqual(self.run_script("--main").returncode, 0)

    def test_deduplicates_interleaved_blocks_and_ignores_partial_tail(self):
        first, last = self.event(1, 1000), self.event(2, 2000)
        path = self.transcript(events=[first, last, first, last])
        with path.open("a") as stream:
            stream.write('{"type": "assistant"')
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual(result["turns"], "2")
        self.assertEqual(result["janela"], "2000")

    def test_missing_usage_and_corrupt_lines_are_not_ok(self):
        path = self.transcript(events=[{"type": "user", "message": "início"}])
        self.assertEqual(self.run_script("agente-run-x").returncode, 69)
        path.write_text(json.dumps(self.event(1, 1000)) + "\n{invalid}\n", encoding="utf-8")
        self.assertEqual(self.run_script("agente-run-x").returncode, 69)

    def test_latest_turn_without_usage_never_reuses_old_measurement(self):
        missing = {"type": "assistant", "message": {"id": "msg-2", "usage": {}}}
        self.transcript(events=[self.event(1, 1000), missing])
        self.assertEqual(self.run_script("agente-run-x").returncode, 69)
        self.transcript(events=[self.event(1, 1000), missing, self.event(2, 2000)])
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual((result["turns"], result["janela"]), ("2", "2000"))

    def test_historical_missing_usage_does_not_erase_a_turn(self):
        missing = {"type": "assistant", "message": {"id": "msg-2", "usage": {}}}
        self.transcript(events=[self.event(1, 1000), missing, self.event(3, 3000)])
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual((result["turns"], result["janela"]), ("3", "3000"))

    def test_reserve_clamps_next_checkpoint_and_requests_handoff(self):
        self.transcript(windows=range(1000, 44001, 1000))
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual((result["turns"], result["proxima"], result["status"]), ("44", "45", "ok"))
        self.transcript(windows=range(1000, 45001, 1000))
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual((result["turns"], result["proxima"], result["status"]), ("45", "45", "handoff"))

    def test_low_growth_at_turn_reserve_signals_review(self):
        self.transcript(windows=[1000] * 45)
        self.assertEqual(self.fields(self.run_script("agente-run-x"))["status"], "preso")

    def test_projection_and_token_reserve(self):
        self.transcript(windows=range(80000, 121000, 5000))
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual(result["janela"], "120000")
        self.assertEqual(result["status"], "handoff")
        self.transcript(windows=[130000])
        self.assertEqual(self.fields(self.run_script("agente-run-x"))["status"], "handoff")

    def test_context_compaction_does_not_reset_turns(self):
        self.transcript(windows=list(range(50000, 101000, 1000)) + [10000])
        result = self.fields(self.run_script("agente-run-x"))
        self.assertEqual(result["turns"], "52")
        self.assertNotEqual(result["status"], "ok")

    def test_invalid_configuration_fails_explicitly(self):
        self.transcript()
        for env in ({"TETO": "zero"}, {"TETO": "0"}, {"RESERVA_TURNS": "50"},
                    {"RESERVA_TOKENS": "140000"}, {"PISO": "101"}, {"PASSO": "0"}):
            with self.subTest(env=env):
                self.assertEqual(self.run_script("agente-run-x", **env).returncode, 64)


if __name__ == "__main__":
    unittest.main()
