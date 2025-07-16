import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'shared-types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies['refresh_token'],
      ]),
      secretOrKey: configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new Error('Refresh token is malformed.');
    }

    // req.user에 아래 객체가 주입됩니다.
    // 이 값은 이후 Controller의 @Req() 데코레이터를 통해 접근할 수 있습니다.
    return { ...payload, refreshToken }; // req.user에 payload와 refreshToken이 주입됨
  }
}
