import { Body, Controller, Delete, Get, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser, UseJWT } from '@src/decorators';
import { Logger } from '@src/logger';
import {
  CommonResponse,
  ResponseDTO,
  ResponseObject,
  ResponseService,
} from '@src/util';
import { LeanUser, UpdateUserPayload, User } from './schema/user.schema';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly logger: Logger,
    private readonly responseService: ResponseService,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(UserController.name);
  }

  @ApiOperation({ summary: 'update user details' })
  @ApiResponse({
    type: ResponseDTO(LeanUser).LeanUserResponse,
    status: 200,
    description: 'user updated',
  })
  @CommonResponse({ 400: 'no authorization header', 401: 'unauthenticated' })
  @UseJWT()
  @Put('me')
  async updateUser(
    @CurrentUser() user: User,
    @Body() update: UpdateUserPayload,
  ): Promise<ResponseObject<LeanUser>> {
    this.logger.setMethodName('updateUser').info('updating user details');
    const leanUser = await this.userService.updateUserDetails(user, update);

    return this.responseService.json('user details updated', leanUser);
  }

  @ApiOperation({ summary: 'get user' })
  @ApiResponse({
    type: ResponseDTO(LeanUser).LeanUserResponse,
    status: 200,
    description: 'user',
  })
  @CommonResponse({ 400: 'no authorization header', 401: 'unauthenticated' })
  @UseJWT()
  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: User,
  ): Promise<ResponseObject<LeanUser>> {
    this.logger.setMethodName('getCurrentUser').info('getting current user');
    const leanUser = user.toJSON();

    return this.responseService.json('user details', leanUser);
  }

  @ApiOperation({ summary: 'delete user' })
  @ApiResponse({
    type: ResponseDTO(LeanUser).LeanUserResponse,
    status: 200,
    description: 'deleted user',
  })
  @CommonResponse({ 400: 'no authorization header', 401: 'unauthenticated' })
  @UseJWT()
  @Delete('me')
  async deleteCurrentUser(
    @CurrentUser() user: User,
  ): Promise<ResponseObject<LeanUser>> {
    this.logger.setMethodName('deletCurrentUser').info('deleting user');
    const leanUser = await this.userService.deleteUser(user);

    return this.responseService.json('user details', leanUser);
  }
}
