import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Hydrant } from 'src/app/types/hydrant.class';

@Component({
  selector: 'app-hydrant-dialog',
  templateUrl: './hydrant-dialog.component.html',
  styleUrls: ['./hydrant-dialog.component.scss'],
})
export class HydrantDialogComponent {
  @Input() hydrant!: Hydrant;

  constructor(public bsModalRef: BsModalRef) {}

  get title(): string {
    if (!this.hydrant.type || this.hydrant.type === '-') {
      return 'Hydrant';
    }

    return this.hydrant.type;
  }
}
