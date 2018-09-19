import { helper } from '@ember/component/helper';

export function imageType(params/*, hash*/) {
  const type = params[0] || "";
  return type.startsWith('image/');
}

export default helper(imageType);
