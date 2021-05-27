import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Logger } from '@src/logger';
import {
  ResponseObject,
  ResponseService,
  CommonResponse,
  ResponseDTO,
} from '@src/util';
import {
  LoggedInUser,
  LoginPayload,
  ResendEmailVerificationCode,
  ResetPasswordPayload,
  SignupUser,
  VerifyEmail,
} from './schema/authentication.schema';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(
    private readonly responseService: ResponseService,
    private readonly authenticationService: AuthenticationService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(AuthenticationController.name);
  }

  @ApiOperation({ description: 'signup user' })
  @ApiResponse({
    type: ResponseDTO({ base: LoggedInUser }),
    description: 'user signed up successfully',
    status: 201,
  })
  @CommonResponse({ 409: 'email already exists' })
  @Post('signup')
  async signupUser(
    @Body() signupPayload: SignupUser,
  ): Promise<ResponseObject<LoggedInUser>> {
    this.logger.setMethodName('signupUser').info('signing up user');
    const loggedInUser = await this.authenticationService.signupUser(
      signupPayload,
    );

    return this.responseService.json('signup successful', loggedInUser);
  }

  @ApiOperation({ description: 'verify user email' })
  @ApiResponse({
    type: ResponseDTO({ base: LoggedInUser }),
    description: 'user email verified successfully',
    status: 200,
  })
  @CommonResponse({ 400: 'invalid email verification code' })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyUserEmail(
    @Body() { code }: VerifyEmail,
  ): Promise<ResponseObject<LoggedInUser>> {
    this.logger.setMethodName('verifyUserEmail').info('verifying user email');
    const loggedInUser = await this.authenticationService.verifyUserEmail(code);

    return this.responseService.json(
      'user email verified successfully',
      loggedInUser,
    );
  }

  @ApiOperation({ description: 'resend email verification code' })
  @ApiResponse({
    type: ResponseDTO(),
    description: 'verification email resent',
    status: 200,
  })
  @CommonResponse(null)
  @Post('resend-verification-email')
  @HttpCode(HttpStatus.OK)
  async resendEmailVerificationCode(
    @Body() { email }: ResendEmailVerificationCode,
  ): Promise<ResponseObject<null>> {
    this.logger
      .setMethodName('resendEmailVerificationCode')
      .info('resending email verification code');
    await this.authenticationService.resendEmailVerificationCode(email);

    return this.responseService.json('verification email resent');
  }

  @ApiOperation({ description: 'recover forgotten password' })
  @ApiResponse({
    type: ResponseDTO(),
    description: 'recovery code sent to email',
    status: 200,
  })
  @CommonResponse(null)
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() { email }: ResendEmailVerificationCode,
  ): Promise<ResponseObject<null>> {
    this.logger
      .setMethodName('forgotPassword')
      .info('sending password recovery email');
    await this.authenticationService.sendRecoverPasswordEmail(email);

    return this.responseService.json('recovery email sent');
  }

  @ApiOperation({ description: 'reset user password' })
  @ApiResponse({
    type: ResponseDTO({ base: LoggedInUser }),
    description: 'password reset successful',
    status: 200,
  })
  @CommonResponse(null)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordPayload: ResetPasswordPayload,
  ): Promise<ResponseObject<LoggedInUser>> {
    this.logger.setMethodName('resetPassword').info('resetting user password');
    const loggedInUser = await this.authenticationService.resetPassword(
      resetPasswordPayload,
    );

    return this.responseService.json('password reset successful', loggedInUser);
  }

  @ApiOperation({ description: 'login user' })
  @ApiResponse({
    type: ResponseDTO({ base: LoggedInUser }),
    description: 'password reset successful',
    status: 200,
  })
  @CommonResponse({ 401: 'invalid credentials' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() loginPayload: LoginPayload,
  ): Promise<ResponseObject<LoggedInUser>> {
    this.logger.setMethodName('loginUser').info('logging in user');
    const loggedInUser = await this.authenticationService.loginUser(
      loginPayload,
    );

    return this.responseService.json('log in successful', loggedInUser);
  }
}
