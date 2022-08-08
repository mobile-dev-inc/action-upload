const archiver = require("archiver");
const { createWriteStream } = require("fs");

const zipFolder = async (inputDirectory: string, outpuArchive: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const output = createWriteStream(outpuArchive);

        output.on('close', () => {
            resolve(true)
        });

        const archive = archiver('zip');

        archive.on('error', (err: any) => {
            reject(err);
        });

        archive.pipe(output);

        archive.directory(inputDirectory, false);

        archive.finalize();
    });
}

export default zipFolder
