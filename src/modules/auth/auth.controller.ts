import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import type { Request, Response } from 'express';
import { Public } from './decorators/public.decorator';
import { ApiResponse } from '@/common/types/api-response';
import { Throttle } from '@nestjs/throttler';

@Controller('auth/users/')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('admin/login')
  @Public()
  async adminLogin(
    @Body() authCredentials: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse<{ csrfToken: string }>> {
    const { csrfToken } = await this.authService.login(
      authCredentials,
      response,
    );

    return {
      statusCode: 201,
      message: 'success',
      data: { csrfToken },
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('admin/refresh')
  @Public()
  async adminRefresh(
    @Res({ passthrough: true }) response: Response,
    // @Cookies('refreshToken') refreshToken: string,
    @Req() request: Request,
  ): Promise<
    ApiResponse<{
      csrfToken: string;
    }>
  > {
    const refreshToken = request.cookies['refreshToken'] as string;
    const { csrfToken } = await this.authService.refresh(
      refreshToken,
      response,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'user logged in successfully',
      data: { csrfToken },
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('admin/logout')
  @Public()
  async adminLogout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<boolean> {
    const refreshToken = request.cookies['refreshToken'] as string;
    return await this.authService.logout(refreshToken, response);
  }
}
