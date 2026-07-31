import { Module } from '@nestjs/common';
import { WikimediaImageService } from './wikimedia-image.service';

@Module({
  providers: [WikimediaImageService],
  exports: [WikimediaImageService],
})
export class ImagesModule {}
