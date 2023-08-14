using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using YoutubeExplode;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VideoController : ControllerBase
    {
        [HttpGet("convert")]
        public async Task<IActionResult> ConvertToMp3([FromQuery] string url)
        {
            var youtube = new YoutubeClient();
            var video = await youtube.Videos.GetAsync(url);
            var streamManifest = await youtube.Videos.Streams.GetManifestAsync(video.Id);
            var audioStreamInfo = streamManifest.GetAudioStreams().OrderByDescending(s => s.Bitrate).FirstOrDefault();

            if (audioStreamInfo == null)
                return BadRequest("No suitable audio stream found.");

            var stream = await youtube.Videos.Streams.GetAsync(audioStreamInfo);

            var tempFileName = Path.GetTempFileName();
            await using (var fileStream = System.IO.File.OpenWrite(tempFileName))
            {
                await stream.CopyToAsync(fileStream);
            }

            var outputFileName = Path.ChangeExtension(tempFileName, ".mp3");
            var ffmpegArguments = $"-i \"{tempFileName}\" \"{outputFileName}\"";

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = @"C:\Users\Razer\Documents\ffmpeg-2023-08-14-git-c704901324-full_build\ffmpeg-2023-08-14-git-c704901324-full_build\bin\ffmpeg.exe",
                    Arguments = ffmpegArguments,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                }
            };

            process.Start();
            process.WaitForExit();

            var mp3Bytes = await System.IO.File.ReadAllBytesAsync(outputFileName);
            System.IO.File.Delete(tempFileName);
            System.IO.File.Delete(outputFileName);

            return File(mp3Bytes, "audio/mpeg", $"{video.Title}.mp3");
        }
    }
}