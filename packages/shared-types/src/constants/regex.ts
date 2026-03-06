/**
 * @description 비밀번호 정규식
 * - 영문, 숫자, 특수문자를 각각 최소 1개 이상 포함한 8자리 이상 문자열
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~`|}{[\]:;?><,./\-=])[A-Za-z\d!@#$%^&*()_+~`|}{[\]:;?><,./\-=]{8,}$/

/**
 * @description 이미지 타입 정규식
 * 전달된 이미지 타입이 jpeg, jpg, png, webp 중 하나인지 확인
 */
export const IMAGE_TYPE_REGEX = /image\/(jpeg|jpg|png|webp)$/
