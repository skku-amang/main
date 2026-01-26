import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from "@nestjs/common"
import { MAX_FILE_SIZE, IMAGE_TYPE_REGEX } from "@repo/shared-types"

export const imageFileValidationPipe = new ParseFilePipe({
  fileIsRequired: true,
  validators: [
    new MaxFileSizeValidator({
      maxSize: MAX_FILE_SIZE,
      message: (maxSize) => {
        const mbSize = (maxSize / 1024 / 1024).toFixed(0)
        return `파일 용량은 ${mbSize}MB를 초과할 수 없습니다.`
      }
    }),
    new FileTypeValidator({
      fileType: IMAGE_TYPE_REGEX
    })
  ]
})

export const optionalImageFileValidationPipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({
      maxSize: MAX_FILE_SIZE,
      message: (maxSize) => {
        const mbSize = (maxSize / 1024 / 1024).toFixed(0)
        return `파일 용량은 ${mbSize}MB를 초과할 수 없습니다.`
      }
    }),
    new FileTypeValidator({
      fileType: IMAGE_TYPE_REGEX
    })
  ]
})
