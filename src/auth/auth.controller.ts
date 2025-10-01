import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import type { Request, Response } from 'express';
import { Cookies } from '@/common/decorators/cookie.decorator';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';

@Controller('auth/users/')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('admin/login')
  @Public()
  async adminLogin(
    @Body() authCredentials: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, csrfSignature } =
      await this.authService.login(authCredentials);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });

    response.cookie('csrfSignature', csrfSignature, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, csrfSignature };
  }

  @Post('admin/refresh')
  @Public()
  async adminRefresh(
    @Res({ passthrough: true }) response: Response,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const {
      accessToken,
      csrfSignature,
      refreshToken: newRefreshToken,
    } = await this.authService.refresh(refreshToken);

    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.configService.get<number>('REFRESH_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });

    response.cookie('csrfSignature', csrfSignature, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { success: true, csrfSignature };
  }

  @Post('admin/logout')
  @Public()
  async adminLogout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean }> {
    const refreshToken = request.cookies['refreshToken'] as string;
    if (!refreshToken) {
      response.clearCookie('refreshToken');
      response.clearCookie('accessToken');
      response.clearCookie('csrfSignature');
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }
    const success = await this.authService.logout(refreshToken);

    if (!success) {
      response.clearCookie('refreshToken');
      response.clearCookie('accessToken');
      response.clearCookie('csrfSignature');
      throw new CustomHttpException(EXCEPTIONS.BAD_REQUEST);
    }

    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');
    response.clearCookie('csrfSignature');
    return { success: true };
  }
}
