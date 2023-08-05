import os
import json
import argparse
from moviepy.editor import ImageClip, TextClip, CompositeVideoClip, clips_array
import imageio

# 커맨드 라인 인자 받기
parser = argparse.ArgumentParser(description='Process video creation arguments')
parser.add_argument('--image', type=str, help='Path to the image file')
parser.add_argument('--video', type=str, help='Path to the video file')
parser.add_argument('--cuts', type=str, help='JSON string containing cuts information')
args = parser.parse_args()

# 이미지 파일 경로와 컷 정보 가져오기
image_file_path = args.image
cuts_json = args.cuts
cuts = json.loads(cuts_json)

# 이미지 클립 생성
image_clip = ImageClip(image_file_path)

# 비디오 클립 생성
clips = []
for cut in cuts:
    start_time = cut['start']
    end_time = cut['end']
    subtitle = cut['subtitle']
    
    text_clip = TextClip(subtitle, fontsize=50, color='white').set_position('bottom').set_duration(end_time - start_time)
    composite_clip = CompositeVideoClip([image_clip.set_duration(end_time - start_time), text_clip], size=image_clip.size)
    
    clips.append(composite_clip)

final_clip = clips_array([clips])

# 비디오 파일 저장
output_file_path = args.video
final_clip.write_videofile(output_file_path, codec='libx264', fps=30)
