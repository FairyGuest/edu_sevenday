import { formatStaticUrl, getStorageToken } from '@/utils';
import { cogUrl } from '@/utils/host';

export type PhotoQuestionImageUploadMode = 'default' | 'photo';

export type UploadedEditorImage = {
  /** 编辑器内展示用 */
  displaySrc: string;
  /** 保存到后端的相对路径 */
  saveSrc: string;
};

export const PERSONAL_QUESTIONS_IMAGE_PREFIX = 'edu-assistant/personal-questions/';

const resolveLegacyUploadFileData = (response: any) => {
  const raw = response?.data;
  return Array.isArray(raw) ? raw[0] : raw;
};

/** 将 uploadFile 返回的相对路径转为可展示的图片地址 */
export const resolveUploadedImageDisplaySrc = (url?: string) => {
  if (!url) return '';
  if (url.includes('http://') || url.includes('https://')) return url;
  const withSlash = url.startsWith('/') ? url : `/${url}`;
  const path = withSlash.replace(/^\/edu-assistant\//, '/');
  return formatStaticUrl(path);
};

/**
 * 若 src 含 edu-assistant/personal-questions/，只保留相对路径：
 * edu-assistant/personal-questions/xxx.png
 */
export const extractPersonalQuestionImagePath = (src?: string) => {
  if (!src || typeof src !== 'string') return src || '';
  const start = src.indexOf(PERSONAL_QUESTIONS_IMAGE_PREFIX);
  if (start < 0) return src;
  return src.slice(start).split('?')[0].split('#')[0];
};

const parseLegacyUploadResponse = (res: any): UploadedEditorImage => {
  const data = resolveLegacyUploadFileData(res);
  const saveSrc = data?.url || '';
  const displaySrc = resolveUploadedImageDisplaySrc(saveSrc);
  if (!saveSrc || !displaySrc) {
    throw new Error(res?.msg || '图片上传失败');
  }
  return { displaySrc, saveSrc };
};

const parsePhotoUploadResponse = (res: any): UploadedEditorImage => {
  const file = res?.data?.file;
  const saveSrc = file?.url || '';
  const displaySrc = res?.data?.showUrl || resolveUploadedImageDisplaySrc(saveSrc);
  if (!saveSrc || !displaySrc) {
    throw new Error(res?.msg || '图片上传失败');
  }
  return { displaySrc, saveSrc };
};

export const uploadPhotoQuestionImage = async (
  file: File,
  mode: PhotoQuestionImageUploadMode = 'default',
): Promise<UploadedEditorImage> => {
  const formData = new FormData();
  formData.append('file', file);
  const apiPath =
    mode === 'photo'
      ? '/web/photoQuestion/uploadFileForPhoto'
      : '/web/photoQuestion/uploadFile';
  const response = await fetch(`${cogUrl}${apiPath}`, {
    method: 'POST',
    headers: {
      Authorization: getStorageToken() || '',
    },
    body: formData,
  });
  const res = await response.json();
  if (res?.code !== 200) {
    throw new Error(res?.msg || '图片上传失败');
  }
  return mode === 'photo'
    ? parsePhotoUploadResponse(res)
    : parseLegacyUploadResponse(res);
};

/** 将编辑器 HTML 中 img 整理为可落库路径（优先 data-url，其次 personal-questions 相对路径） */
export const normalizeEditorHtmlImageSrcForSave = (html: string) => {
  if (!html || typeof html !== 'string') return html;
  if (!html.includes('<img') && !html.includes('data-url')) return html;

  if (typeof DOMParser === 'undefined') {
    return html.replace(
      /(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)/gi,
      (_match, prefix: string, src: string, suffix: string) => {
        const nextSrc = extractPersonalQuestionImagePath(src);
        return `${prefix}${nextSrc}${suffix}`;
      },
    );
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((img) => {
    const dataUrl = img.getAttribute('data-url');
    if (dataUrl) {
      img.setAttribute('src', extractPersonalQuestionImagePath(dataUrl) || dataUrl);
      img.removeAttribute('data-url');
      return;
    }
    const src = img.getAttribute('src') || '';
    if (src.includes(PERSONAL_QUESTIONS_IMAGE_PREFIX)) {
      img.setAttribute('src', extractPersonalQuestionImagePath(src));
    }
  });
  return doc.body.innerHTML;
};

/** 递归处理题干/选项/答案/解析等富文本字段中的图片路径 */
export const normalizeTopicEditorFieldsForSave = (value: any): any => {
  if (value == null) return value;
  if (typeof value === 'string') {
    return normalizeEditorHtmlImageSrcForSave(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeTopicEditorFieldsForSave(item));
  }
  if (typeof value === 'object') {
    if (typeof value.content === 'string' || typeof value.text === 'string') {
      return {
        ...value,
        ...(typeof value.content === 'string'
          ? { content: normalizeEditorHtmlImageSrcForSave(value.content) }
          : {}),
        ...(typeof value.text === 'string'
          ? { text: normalizeEditorHtmlImageSrcForSave(value.text) }
          : {}),
      };
    }
  }
  return value;
};

export const markEditorImageSaveSrc = (
  root: ParentNode,
  displaySrc: string,
  saveSrc: string,
) => {
  const imgs = Array.from(root.querySelectorAll('img'));
  const target =
    imgs.find((img) => img.getAttribute('src') === displaySrc) ||
    imgs[imgs.length - 1];
  target?.setAttribute('data-url', saveSrc);
};
