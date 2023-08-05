// import { CustomRequest } from "../types/customRequest";
// import { NextFunction, Response } from "express";
// import { exec } from "child_process";
// import path from "path";

// export const createVideo = async (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { image } = req.body;

//     // 이미지와 컷 정보
//     const imageFilePath = path.join(
//       __dirname,
//       `../../public/images/${image}.jpg`
//     );
//     const cuts = [
//       { start: 0, end: 20, subtitle: "가" },
//       { start: 20, end: 40, subtitle: "나" },
//       { start: 40, end: 60, subtitle: "다" },
//     ];

//     // FFmpeg 명령어 생성
//     const frameRate = 30;
//     const outputFilePath = path.join(
//       __dirname,
//       `../../public/videos/${image}.mp4`
//     );
//     const outputWidth = 720;
//     const outputHeight = 1280;
//     let drawTextFilters = "";

//     cuts.forEach((cut) => {
//       const drawTextFilter = `drawtext=text='${cut.subtitle}':x=(w-tw)/2:y=h-th-50:fontsize=30:fontcolor=white:enable='between(t,${cut.start},${cut.end})'`;
//       drawTextFilters += `${drawTextFilter},`;
//     });
//     drawTextFilters = drawTextFilters.slice(0, -1); // 마지막 쉼표 제거

//     const ffmpegCommand = `ffmpeg -y -i ${imageFilePath} -vf "${drawTextFilters}" -r ${frameRate} -s ${outputWidth}x${outputHeight} -c:v libx264 -pix_fmt yuv420p ${outputFilePath}`;

//     // FFmpeg 실행
//     exec(ffmpegCommand, (error, stdout, stderr) => {
//       if (error) {
//         console.error("Error generating video:", error);
//         next(error);
//         return;
//       }
//       res.status(200).json({ message: "Video created successfully" });
//     });
//   } catch (error) {
//     console.error("동영상 생성 중 오류: ", error);
//     next(error);
//   }
// };

import { CustomRequest } from "../types/customRequest";
import { NextFunction, Response } from "express";
import { exec } from "child_process";
import path from "path";

export const createVideo = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { image } = req.body;
    const cuts = [
      { start: 0, end: 10, subtitle: "첫 번째 컷" },
      { start: 10, end: 20, subtitle: "두 번째 컷" },
      { start: 20, end: 30, subtitle: "세 번째 컷" },
      // ... 더 많은 컷 정보
    ];
    // 이미지와 컷 정보
    const imageFilePath = path.join(
      __dirname,
      `../../public/images/${image}.jpg`
    );
    const videoFilePath = path.join(
      __dirname,
      `../../public/videos/${image}.mp4`
    );
    // 파이썬 스크립트 실행
    const pythonScriptPath = path.join(
      __dirname,
      "../../src/python_scripts/create_video.py"
    );
    const command = `python3 ${pythonScriptPath} --image="${imageFilePath}" --video="${videoFilePath}" --cuts='${JSON.stringify(
      cuts
    )}'`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error generating video:", error);
        next(error);
        return;
      }
      // 파이썬 스크립트 실행 결과 (stdout) 처리
      const message = stdout.trim(); // 예시: "Video created successfully"
      res.status(200).json({ message });
    });
  } catch (error) {
    console.error("동영상 생성 중 오류: ", error);
    next(error);
  }
};
