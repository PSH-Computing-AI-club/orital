export function getRequestBody(
    request: Request,
): Promise<string | Blob | BufferSource | FormData | URLSearchParams> {
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
        return request.text();
    } else if (contentType.includes("application/octet-stream")) {
        return request.arrayBuffer();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
        return request.text().then((text) => new URLSearchParams(text));
    } else if (contentType.includes("multipart/form-data")) {
        return request.formData();
    } else if (contentType.startsWith("text/")) {
        return request.text();
    } else {
        return request.blob();
    }
}
