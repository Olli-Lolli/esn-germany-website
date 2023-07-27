import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Observable, firstValueFrom, interval, map, share, shareReplay } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import {
  GeneralInformationService,
  IGeneralInformationItem,
} from 'src/app/services/general-information.service';
import { environment as env } from 'src/environments/environment';
import { ContentService, IContentItem } from 'src/app/services/content.service';

@Component({
  selector: 'esn-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', [animate(600)]),
    ]),
  ],
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  index: number = 0;
  numImages: number = 3;
  imagesLoaded: number = 0;
  loading: boolean = true;
  imagesUrl = [
    '/assets/landing/landing1.png',
    '/assets/landing/landing2.png',
    '/assets/landing/landing3.png',
  ];

  generalInformation: IGeneralInformationItem = {} as IGeneralInformationItem;
  contentItems$: Observable<IContentItem[]>;
  isAnimated: boolean = false;
  doneAnimating: boolean = false;

  public landing_image_div0: string = '';
  public landing_image_div1: string = '';
  public landing_image_div2: string = '';

  @ViewChild('a', { static: false }) a: any;
  @ViewChild('b', { static: false }) b: any;
  @ViewChild('c', { static: false }) c: any;

  constructor(
    private render: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private generalInformationService: GeneralInformationService,
    private contentService: ContentService
  ) {}

  async ngOnInit() {
    this.contentItems$ = this.contentService.fetchPageContent('Home').pipe(
      shareReplay(1),
      map((res: any) => res.data)
    );
    this.generalInformation = await firstValueFrom(
      this.generalInformationService.fetchGeneralInformation()
    );
    if (this.generalInformation.background_photos.length > 0) {
      this.landing_image_div0 =
        this.generalInformation.background_photos[0].directus_files_id;
      this.landing_image_div1 =
        // @ts-ignore:next-line
        this.generalInformation.background_photos[1].directus_files_id;
      this.landing_image_div2 =
        // @ts-ignore:next-line
        this.generalInformation.background_photos[2].directus_files_id;
    }
  }

  async ngAfterViewInit() {
    this.imagesUrl.forEach((x, index) => {
      const image = new Image();
      image.onload = () => {
        this.imagesLoaded++;
      };
      image.src = x;
    });
    // TODO: solve this in a way that makes the app go stable
    interval(2000).subscribe(() => {
      // this.index = (this.index + 1) % this.numImages;
      var image0 = this.document.getElementsByClassName(
        'div0'
        )[0] as HTMLDivElement;
      if (image0) {
        image0.style.backgroundImage = `url(${env.DIRECTUS_URL_IMAGE}${this.landing_image_div0})`;
      }
      var image1 = this.document.getElementsByClassName(
        'div1'
      )[0] as HTMLDivElement;
      if (image1) {
        image1.style.backgroundImage = `url(${env.DIRECTUS_URL_IMAGE}${this.landing_image_div1})`;
      }
      var image2 = this.document.getElementsByClassName(
        'div2'
      )[0] as HTMLDivElement;
      if (image2) {
        image2.style.backgroundImage = `url(${env.DIRECTUS_URL_IMAGE}${this.landing_image_div2})`;
      }
    });


    const section_count = await firstValueFrom(
      this.generalInformationService.fetchGeneralInformation()
    ).then((x) => x.section_counter);

    this.render.listen('window', 'scroll', () => {
      let aPosition = this.a.nativeElement.getBoundingClientRect();
      if (
        !this.doneAnimating &&
        aPosition.top >= 0 &&
        aPosition.bottom <= window.innerHeight
      ) {
        if (this.isAnimated == false) {
          this.animateValue(this.a, 0, 1200, 1100);
          this.animateValue(this.b, 0, 10600, 1800);
          this.animateValue(this.c, 0, section_count, 630);

          setTimeout(function () {
            this.isAnimated = true;
            const aEl = this.document.getElementById('a');
            if (aEl) {
              aEl.innerHTML = '1 200 +';
            }
          }, 1100);
          setTimeout(function () {
            this.isAnimated = true;
            const bEl = this.document.getElementById('b');
            if (bEl) {
              bEl.innerHTML = '10 600 +';
            }
          }, 1800);
          this.doneAnimating = true;
        }
      }
    });
  }

  private animateValue(obj, start, end, duration): void {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.nativeElement.innerHTML = Math.floor(
        progress * (end - start) + start
      );
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}
