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
  ResendEmailVerificationCode,
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
  @CommonResponse({ 409: 'email already exists' }, [400])
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
  @CommonResponse({ 400: 'invalid email verification code' }, [409])
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
  @CommonResponse(null, [409, 400])
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
  @CommonResponse(null, [409, 400])
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
}
