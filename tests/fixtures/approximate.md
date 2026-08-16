The design system adoption evaluation framework was rejected. The agent task
queue priority handler stayed.

Having reviewed the logs, the cause is clear. While the tests pass, the build
fails. Running the migration, the schema changed.

What this does is remove the check. It was the fixture that failed.

The profile wins. The test wants a fixture. The parser refuses the input.

The build failed — the cause was a missing fixture.
