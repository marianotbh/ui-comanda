export class TokenDTO<T = any> {
	public iss: string;
	public iat: string;
	public aud: string;
	public exp: string;
	public payload: T;
}
