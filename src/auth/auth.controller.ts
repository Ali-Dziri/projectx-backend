import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import type { Request, Response } from 'express';
import { Cookies } from '@/common/decorators/cookie.decorator';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { CustomHttpException } from '@/exceptions/custom-http-exception';
import { EXCEPTIONS } from '@/exceptions/exceptions-list';
import { ApiResponse } from '@/common/types/api-response';

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
  ): Promise<ApiResponse<{ csrfToken: string }>> {
    const { accessToken, refreshToken, csrfToken, newRefresh } =
      await this.authService.login(authCredentials);

    if (newRefresh) {
      response.clearCookie('refreshToken');
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: this.configService.get<number>('REFRESH_TOKEN_MAX_AGE'),
        sameSite: 'lax',
      });
    }

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });

    response.cookie('csrfToken', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return {
      statusCode: 201,
      message: 'success',
      data: { csrfToken },
    };
  }

  @Post('admin/refresh')
  @Public()
  async adminRefresh(
    @Res({ passthrough: true }) response: Response,
    @Cookies('refreshToken') refreshToken: string,
  ): Promise<
    ApiResponse<{
      csrfToken: string;
    }>
  > {
    const {
      accessToken,
      csrfToken,
      refreshToken: newRefreshToken,
      newRefresh,
    } = await this.authService.refresh(refreshToken);
    response.clearCookie('accessToken');
    response.clearCookie('csrfToken');
    if (newRefresh) {
      response.clearCookie('refreshToken');
      response.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: this.configService.get<number>('REFRESH_TOKEN_MAX_AGE'),
        sameSite: 'lax',
      });
    }

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: this.configService.get<number>('ACCESS_TOKEN_MAX_AGE'),
      sameSite: 'lax',
    });

    response.cookie('csrfToken', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return {
      statusCode: HttpStatus.CREATED,
      message: 'user logged in successfully',
      data: { csrfToken },
    };
  }

  @Post('admin/logout')
  @Public()
  async adminLogout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = request.cookies['refreshToken'] as string;
    if (!refreshToken) {
      response.clearCookie('refreshToken');
      response.clearCookie('accessToken');
      response.clearCookie('csrfToken');
      throw new CustomHttpException(EXCEPTIONS.UNAUTHORIZED);
    }
    const success = await this.authService.logout(refreshToken);

    if (!success) {
      response.clearCookie('refreshToken');
      response.clearCookie('accessToken');
      response.clearCookie('csrfToken');
      throw new CustomHttpException(EXCEPTIONS.BAD_REQUEST);
    }

    response.clearCookie('refreshToken');
    response.clearCookie('accessToken');
    response.clearCookie('csrfToken');
  }
}
