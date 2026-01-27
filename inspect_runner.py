import inspect
from google.adk.runners import InMemoryRunner

print("Signature of InMemoryRunner.__init__:")
try:
    print(inspect.signature(InMemoryRunner.__init__))
except Exception as e:
    print(f"Error inspecting signature: {e}")

print("\nHelp on InMemoryRunner:")
help(InMemoryRunner)
