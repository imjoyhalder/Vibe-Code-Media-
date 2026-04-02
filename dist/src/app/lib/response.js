export const sendResponse = (res, statusCode, success, message, data, error) => {
    const response = {
        success,
        message,
    };
    if (data !== undefined) {
        response.data = data;
    }
    if (error) {
        response.error = error;
    }
    res.status(statusCode).json(response);
};
export const sendSuccess = (res, message, data, statusCode = 200) => {
    sendResponse(res, statusCode, true, message, data);
};
export const sendError = (res, message, statusCode = 500, error) => {
    sendResponse(res, statusCode, false, message, undefined, error);
};
