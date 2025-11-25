import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SavedMoviesService } from './saved-movies.service';
import { ListSavedMoviesQueryDto } from './dto/list-saved-movies.dto';
import { SaveMovieDto } from './dto/save-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { ErrorCode } from '../common/constants/error-codes';
import { AppHttpException } from '../common/exceptions/app.exception';

@ApiTags('saved-movies')
@ApiBearerAuth()
@Controller('users/:userId/saved-movies')
@UseGuards(JwtAuthGuard)
export class SavedMoviesController {
  constructor(private readonly savedMoviesService: SavedMoviesService) {}

  @Get()
  list(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSavedMoviesQueryDto,
  ) {
    this.assertOwnership(userId, user.sub);
    return this.savedMoviesService.list(userId, query);
  }

  @Post()
  save(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SaveMovieDto,
  ) {
    this.assertOwnership(userId, user.sub);
    return this.savedMoviesService.save(userId, dto);
  }

  @Delete(':movieId')
  @HttpCode(204)
  remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('movieId', ParseIntPipe) movieId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.assertOwnership(userId, user.sub);
    return this.savedMoviesService.remove(userId, movieId);
  }

  private assertOwnership(userId: number, authUserId?: number) {
    if (!authUserId || userId !== authUserId) {
      throw new AppHttpException(
        ErrorCode.FORBIDDEN,
        'You are not allowed to access this resource',
        403,
      );
    }
  }
}
