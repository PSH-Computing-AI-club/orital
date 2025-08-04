export type IFormDataObject = Record<string, boolean | number | string | Blob>;

export function buildFormData<T extends IFormDataObject>(object: T): FormData {
    const formData = new FormData();

    for (const key in object) {
        const value = object[key];

        formData.append(key, value.toString());
    }

    return formData;
}
