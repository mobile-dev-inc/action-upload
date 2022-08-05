const zipFolder = (inputDirectory: string, outpuArchive: string) => {
    const archiver = require("archiver");
    const { createWriteStream } = require("fs");

    const output = createWriteStream(outpuArchive);

    const archive = archiver('zip');
    archive.pipe(output);

    archive.directory(inputDirectory, false);

    archive.finalize();
}

export default zipFolder
