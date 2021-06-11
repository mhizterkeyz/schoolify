import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ResponseObject, ResponseService } from '@src/util/response.service';
import { Logger } from '@src/logger/logger.service';
import { ResponseDTO } from '@src/util/common/response.dto';
import { CommonResponse } from '@src/util/common/common.response';
import { User } from '@src/user/schema/user.schema';
import { UseJWT } from '@src/decorators/use-jwt.decorator';
import {
  ChangePasswordPayload,
  LoggedInUser,
  LoginPayload,
  ResendEmailVerificationCode,
  ResetPasswordPayload,
  SignupUser,
  UpdateUserEmailDTO,
  VerifyEmail,
} from './schema/authentication.schema';
import { AuthenticationService } from './authentication.service';
import { CurrentUser } from '../decorators/current-user.decorator';

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
    type: ResponseDTO(LoggedInUser).LoggedInUserResponse,
    description: 'user signed up successfully',
    status: 201,
  })
  @CommonResponse(null)
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
    type: ResponseDTO(LoggedInUser).LoggedInUserResponse,
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
    type: ResponseDTO().Response,
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
    type: ResponseDTO().Response,
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
    type: ResponseDTO(LoggedInUser).LoggedInUserResponse,
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
    type: ResponseDTO(LoggedInUser).LoggedInUserResponse,
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

  @ApiOperation({ description: 'update user email' })
  @ApiResponse({
    type: ResponseDTO(LoggedInUser).LoggedInUserResponse,
    description: 'email updated',
    status: 200,
  })
  @CommonResponse({
    401: 'unauthorized',
    400: 'bad request',
  })
  @UseJWT()
  @ApiBearerAuth()
  @Post('change-email')
  @HttpCode(HttpStatus.OK)
  async updateUserEmail(
    @CurrentUser() user: User,
    @Body() { email }: UpdateUserEmailDTO,
  ): Promise<ResponseObject<LoggedInUser>> {
    this.logger.setMethodName('updateUserEmail').info('updating user email');
    const loggedInUser = await this.authenticationService.updateUserEmail(
      user,
      email,
    );

    return this.responseService.json(
      'email updated and verification code sent',
      loggedInUser,
    );
  }

  @ApiOperation({ description: 'change user password' })
  @ApiResponse({
    type: ResponseDTO(LoggedInUser).LoggedInUserResponse,
    description: 'password updated',
    status: 200,
  })
  @CommonResponse({
    401: 'unauthorized',
    400: 'bad request',
  })
  @UseJWT()
  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: User,
    @Body() { password }: ChangePasswordPayload,
  ): Promise<ResponseObject<LoggedInUser>> {
    this.logger.setMethodName('updateUserEmail').info('changing user password');
    const loggedInUser = await this.authenticationService.updateUserPassword(
      user,
      password,
    );

    return this.responseService.json('password updated', loggedInUser);
  }
}
