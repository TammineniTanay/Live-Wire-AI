import deepgram
import sys

print(f"Python is running from: {sys.executable}")
print(f"Deepgram library is at: {deepgram.__file__}")

# This lists every tool inside the deepgram module
print("\nScanning Deepgram for tools...")
for item in dir(deepgram):
    if "Live" in item or "Option" in item:
        print(f"Found: {item}")

# This tests the 'lazy loading' structure of v5.3.1
try:
    from deepgram.client.live.v1 import LiveOptions, LiveTranscriptionEvents
    print("\n✅ Path Found: deepgram.client.live.v1")
except:
    try:
        from deepgram.clients.live.v1 import LiveOptions, LiveTranscriptionEvents
        print("\n✅ Path Found: deepgram.clients.live.v1")
    except Exception as e:
        print(f"\n❌ Still hidden. Error: {e}")