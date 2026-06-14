**Plan**

1. **Separate the task message route into its own file**
   - Move the handler that adds a message to a task into a dedicated, self-contained route file
   - Keep the same request validation: a task identifier from the route and a non-empty message from the request body
   - Preserve the existing behavior of running the message through the agent and returning the updated task alongside Ben's reply
   - Reuse the shared task repository and agent provider exactly as they are wired today

2. **Separate the task content update route into its own file**
   - Move the handler that updates a task's text content into a dedicated, self-contained route file
   - Keep the same request validation: a task identifier from the route and a text content value from the request body
   - Preserve the existing behavior of returning the updated task

3. **Separate the task todos update route into its own file**
   - Move the handler that updates a task's todo list into a dedicated, self-contained route file
   - Keep the same request validation: a task identifier from the route and a list of todo items (each with identifier, title, done state, and order) from the request body
   - Preserve the existing behavior of returning the updated task

4. **Keep each new route fully self-contained**
   - Ensure every new route file declares its own validation rules and instantiates its own dependencies, matching the existing one-route-per-file convention
   - Duplicate the small task-identifier validation across files where needed rather than sharing it
   - Do not change any request or response behavior compared to the current grouped handlers
