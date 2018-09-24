import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currentImage'
})
export class CurrentImagePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value.startsWith("resources") && !value.startsWith("data"))
      return value + "?t=" + Date.now();
    else
      //probably image reader
      return value;
  }

}
