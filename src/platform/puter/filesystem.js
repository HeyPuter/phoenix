export const CreateFilesystemProvider = ({
    puterSDK,
}) => {
    // The interface for Puter SDK is a good interface for any filesystem
    // provider, so we will use that as the basis for the Puter Shell's
    // own filesystem provider interface.
    return puterSDK.fs;
};
