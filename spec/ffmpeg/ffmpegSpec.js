const fs = require("fs");
let stdout = "";
let stderr = "";

describe("ffmpeg", function () {
  const ffmpeg = require("../../lib/ffmpeg/ffmpeg-webm.js");
  it("displays version", function () {
    const result = ffmpeg({
      arguments: ["-version"],
      print: function (data) { stdout += data + "\n"; },
      printErr: function (data) { stderr += data + "\n"; },
      onExit: function (code) {
        console.log(stdout);
        stdout = "";
        stderr = "";
      },
    });

    console.log(result)
    expect(result !== null).toBe(true);
  });

  it("displays muxers", function () {
    const result = ffmpeg({
      arguments: ["-muxers"],
      print: function (data) { stdout += data + "\n"; },
      printErr: function (data) { stderr += data + "\n"; },
      onExit: function (code) {
        console.log(stdout);
        stdout = "";
        stderr = "";
      },
    });

    console.log(result)
    expect(result !== null).toBe(true);
  });

  describe("convert files", function () {
    convert = function (source, target, codec, format) {
      it(`${source} to ${target}`, function () {
        let stdout = "";
        let stderr = "";

        const arrayBuffer = fs.readFileSync(`data/test.${source}`);
        const bytes = new Uint8Array(arrayBuffer);
        const arguments = [
          "-hide_banner",
          "-i",
          "input"
        ];

        if (codec) {
          if (codec === 'adpcm_yamaha') {
            arguments.push('-ar');
            arguments.push('44100');
          }

          if (codec === 'vorbis' || codec === 'adpcm_yamaha') {
            arguments.push('-strict');
            arguments.push('-2');
          }

          arguments.push('-acodec');
          arguments.push(codec);
        }

        if (format) {
          arguments.push('-f');
          arguments.push(format);
        }

        arguments.push(`output.${target}`);
        console.log(arguments.join(' '));

        const result = ffmpeg({
          arguments: arguments,
          MEMFS: [
            { name: "input", data: bytes }
          ],
          print: function (data) { stdout += data + "\n"; },
          printErr: function (data) { stderr += data + "\n"; },
          onExit: function (code) {
            console.log("Process exited with code " + code);
            console.log(stdout);
            console.log(stderr);
          },
        });

        expect(result).not.toBeNull();
        expect(result.MEMFS).not.toBeNull();
        expect(result.MEMFS.length).toEqual(1);
        expect(result.MEMFS[0].data).not.toBeNull();

        if (!fs.existsSync('out'))
          fs.mkdirSync('out');

        fs.writeFileSync(`out/test.${target}`, result.MEMFS[0].data);
      });
    }

    convert('mp3', 'mp3', 'libmp3lame');
    convert('mp3', 'wav');
    convert('mp3', 'aac', 'aac', 'mp4');
    convert('mp3', 'ogg', 'flac');
    convert('mp3', 'ogg', 'vorbis');
    convert('mp3', 'm4a', 'alac');
    convert('mp3', 'm4r', 'aac', 'ipod');
    convert('mp3', 'flac', 'flac');
    convert('mp3', 'wma', 'wmav2', 'asf');
    convert('mp3', 'opus', 'libopus');
    convert('mp3', 'aiff', 'pcm_s16be');
    convert('mp3', 'mmf', 'adpcm_yamaha');
    convert('mp3', 'wav', 'pcm_mulaw');
  });
});
