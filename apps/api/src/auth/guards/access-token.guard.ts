import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 1. Reflector를 사용해 'isPublic' 메타데이터를 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. 'isPublic'이 true이면, 즉시 접근을 허용
    if (isPublic) {
      return true;
    }

    // 3. 'isPublic'이 아니면, 원래의 JWT 인증 로직을 실행
    return super.canActivate(context);
  }
}
