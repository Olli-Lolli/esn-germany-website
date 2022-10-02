import { Component, OnInit } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ImprintItem, ImprintService } from 'src/app/services/imprint.service';

@Component({
  selector: 'esn-imprint-page',
  templateUrl: './imprint-page.component.html'
})
export class ImprintPageComponent implements OnInit {
  imprintItem$: Observable<ImprintItem[]> | undefined;

  constructor(private imprintService: ImprintService) {}

  async ngOnInit() {
    this.imprintItem$ = this.imprintService
      .fetchImprintList()
      .pipe(shareReplay(1));
  }
}
