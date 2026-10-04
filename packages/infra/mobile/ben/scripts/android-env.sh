# Source this before any Gradle/Android command: `source scripts/android-env.sh`.
# Resolves the JDK by glob so an Adoptium patch bump does not break the path.
_jdk=$(ls -d "$HOME"/.local/tools/jdk-17* 2>/dev/null | sort -V | tail -1)
if [ -z "$_jdk" ]; then
  echo "JDK 17 not found under ~/.local/tools." >&2
else
  export JAVA_HOME="$_jdk"
  export ANDROID_HOME="$HOME/Android/Sdk"
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
  export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
fi
unset _jdk
