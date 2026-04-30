// @vitest-environment node
export class TestAuthHelper {
  static async loginAndGetTokenAsync(testBase, email, password) {
    const { response, body } = await testBase.postJson('/api/auth/login', { email, password });
    if (response.status !== 200) {
      throw new Error(`Login failed for ${email}: ${response.status}`);
    }
    return body.accessToken;
  }
}
