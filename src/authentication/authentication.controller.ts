import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Logger } from '@src/logger';
import { APPLICATION_NAME, LOGGER } from '@src/constants';
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
  private logger: Logger;

  constructor(
    @Inject(LOGGER) logger: Logger,
    private readonly responseService: ResponseService,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.logger = logger.child({
      logLevel: 'AuthenticationController',
      application: APPLICATION_NAME,
    });
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
    const loggedInUser = await this.authenticationService.signupUser(
      signupPayload,
      this.logger,
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
    const loggedInUser = await this.authenticationService.verifyUserEmail(
      code,
      this.logger,
    );

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
    await this.authenticationService.resendEmailVerificationCode(
      email,
      this.logger,
    );

    return this.responseService.json('verification email resent');
  }
}
