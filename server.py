import asyncio, os, io, subprocess, websockets, wave, contextlib
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Evidence Paths
TRANSCRIPT_FILE = "meeting_transcript.txt"
RAW_AUDIO = "raw_session_capture.webm"
FINAL_AUDIO = "final_session_output.mp3"
TEMP_CHUNK = "temp_mono.wav"

def force_init():
    for f in [TRANSCRIPT_FILE, RAW_AUDIO, FINAL_AUDIO, TEMP_CHUNK]:
        if os.path.exists(f): os.remove(f)
    with open(TRANSCRIPT_FILE, "w", encoding="utf-8") as f:
        f.write(f"--- Mono Session: {datetime.now()} ---\n")
    open(RAW_AUDIO, "wb").close()
    print(f"✅ Ready: Files initialized in {os.getcwd()}")

def get_volume(filename):
    """Checks volume level (0-30000)."""
    try:
        with contextlib.closing(wave.open(filename, 'r')) as f:
            frames = f.readframes(f.getnframes())
            if not frames: return 0
            return max(bytes(frames)) 
    except: return 0

async def transcribe_mono(audio_path):
    if not os.path.exists(audio_path): return
    
    # 1. DEBUG: Volume Check
    vol = get_volume(audio_path)
    print(f"📊 Volume Level: {vol}") 

    if vol < 10: 
        print("⚠️ Audio is Silent. Speaking up or playing video...")
        return

    try:
        with open(audio_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1", file=audio_file, response_format="text"
            )
        text = response.strip()
        if text:
            print(f"✅ TEXT: {text}")
            with open(TRANSCRIPT_FILE, "a", encoding="utf-8") as f:
                f.write(f"[{datetime.now().strftime('%H:%M:%S')}] {text}\n")
                f.flush()
                os.fsync(f.fileno())
        else:
            print("⚠️ AI heard audio but found no words.")
    except Exception as e:
        print(f"❌ API Error: {e}")

async def run_transcription(websocket):
    print(f"🤝 Handshake Received: {datetime.now().strftime('%H:%M:%S')}")
    audio_buffer, initial_header = bytearray(), None
    
    try:
        async for message in websocket:
            if isinstance(message, str): continue
            
            with open(RAW_AUDIO, "ab") as f:
                f.write(message)
                f.flush()
                os.fsync(f.fileno())

            if initial_header is None: 
                initial_header = message
                print("📦 Audio flow active...")
                continue
            
            audio_buffer.extend(message)
            
            # Process every 60KB
            if len(audio_buffer) > 60000: 
                print(f"⚙️ Processing...")
                
                # Convert chunk to simple Mono WAV
                with open("temp_raw.webm", "wb") as f:
                    f.write(initial_header + audio_buffer)
                
                # FFmpeg: Convert WebM -> WAV (Mono)
                subprocess.run(['ffmpeg', '-y', '-i', 'temp_raw.webm', '-ac', '1', TEMP_CHUNK], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                
                await transcribe_mono(TEMP_CHUNK)
                audio_buffer = bytearray()
                
    except Exception as e:
        print(f"🔌 Connection closed: {e}")

async def main():
    force_init()
    async with websockets.serve(run_transcription, "127.0.0.1", 5000):
        print("📡 AI Server listening on ws://127.0.0.1:5000")
        await asyncio.Future()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Finalizing...")
        if os.path.exists(RAW_AUDIO) and os.path.getsize(RAW_AUDIO) > 0:
            subprocess.run(['ffmpeg', '-y', '-i', RAW_AUDIO, '-codec:a', 'libmp3lame', '-qscale:a', '2', FINAL_AUDIO], stderr=subprocess.DEVNULL)
        for f in [TEMP_CHUNK, "temp_raw.webm"]:
            if os.path.exists(f): os.remove(f)
        print(f"✅ DONE. Open: {FINAL_AUDIO}")