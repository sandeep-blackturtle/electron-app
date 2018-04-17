module.exports = {

    getFileName: (url) => {
        const nameWithExtension = url
        .split('/').pop()
        .split('\\').pop()
        .split('#')[0];
        return nameWithExtension.replace(/[^a-zA-Z0-9.]/g, '');
    },

    getFileExtension: (fileName) => {
        return fileName.replace(/^.*\./, '');
    },
};
