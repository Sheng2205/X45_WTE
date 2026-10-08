import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { verifyToken } from '../../src/utils/jwt';
import { emailOutbox, lastEmailTo } from '../helpers/email-outbox';
import { DEFAULT_PASSWORD, bearerFor, createUser, readSecrets } from '../helpers/user-factory';

const email = 'user@example.com';
const credentials = { email, password: DEFAULT_PASSWORD };

describe('POST /api/auth/login', () => {
  it('returns 200 with JWT token directly and sends no email', async () => {
    await createUser({ email });

    const response = await request(app).post('/api/auth/login').send(credentials);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({ email });
    expect(verifyToken(response.body.token).email).toBe(email);
    expect(emailOutbox).toHaveLength(0);
  });

  it('rejects a wrong password with 401 and sends no email', async () => {
    await createUser({ email });

    const response = await request(app).post('/api/auth/login').send({ email, password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
    expect(emailOutbox).toHaveLength(0);
  });

  it('returns the same 401 message for an unknown email (no user enumeration)', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@example.com', password: DEFAULT_PASSWORD });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('blocks a user whose email is not verified with 403', async () => {
    await createUser({ email, isEmailVerified: false });

    const response = await request(app).post('/api/auth/login').send(credentials);

    expect(response.status).toBe(403);
    expect(emailOutbox).toHaveLength(0);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user without any secret field', async () => {
    const user = await createUser({ email, displayName: 'Alice' });

    const response = await request(app).get('/api/auth/me').set('Authorization', bearerFor(user));

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(email);
    expect(response.body.displayName).toBe('Alice');
    for (const secret of ['password', 'otpCode', 'resetToken']) {
      expect(response.body).not.toHaveProperty(secret);
    }
  });

  it('requires a token', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('returns 404 when the token points at a deleted user', async () => {
    const user = await createUser({ email });
    const authorization = bearerFor(user);
    await UserModel.deleteOne({ _id: user._id });

    const response = await request(app).get('/api/auth/me').set('Authorization', authorization);

    expect(response.status).toBe(404);
  });
});
