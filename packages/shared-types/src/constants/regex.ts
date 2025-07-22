/**
 * @description 비밀번호 정규식
 * - 영문, 숫자, 특수문자를 각각 최소 1개 이상 포함
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+~`|}{[\]:;?><,./-=]*$/;
