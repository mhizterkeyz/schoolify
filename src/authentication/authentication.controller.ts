import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Logger } from '@logger/index';
import { APPLICATION_NAME, LOGGER } from '@src/constants';
import { ResponseObject, ResponseService } from '@util/index';
import { CommonResponse } from '@util/common/common.response';
import { ResponseDTO } from '@util/common/response.dto';
import { LoggedInUser, SignupUser } from './schema/authentication.schema';
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
}
