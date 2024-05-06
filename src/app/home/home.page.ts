import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { PyhtonPdfService } from '../services/pyhton-pdf.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface IInputFile {
  file: File;
  fileAsBase64: string | ArrayBuffer;
  id: number;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [PyhtonPdfService]
})
export class Tab1Page implements OnInit, AfterViewInit {
  inputFile: IInputFile;
  pdfModel: any

  initializeRead: boolean = false

  urlInput: string = ''
  text = 'Envie um pdf'
  textToShow: string = ''
  speed: number = 0.6
  textOnArray: string[] = []
  textAlreadyRead: string[] = []
  readIndex: number = 0
  readProgress: number = 0


  constructor(
    private pyhtonPdfService: PyhtonPdfService,

    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    TextToSpeech.openInstall()
  }

  ngOnInit(): void {
    this.loadText()
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.textOnArray = this.text.split(' ')
    }, 2000)
  }

  async handleLocalhost() {
    localStorage.setItem('urlLocalhost', this.urlInput)
    const toast = await this.toastController.create({
      message: 'Url salva!',
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }

  async handleFile(event: any): Promise<void> {
    if (event.target.files[0].type === 'application/pdf') {
      this.inputFile = {} as IInputFile;

      this.inputFile = {
        file: event.target.files[0],
      } as IInputFile;

      const loading = await this.loadingCtrl.create({
        message: 'Preparando pdf...',
      });
      loading.present();
      const formData = new FormData()
      formData.append('file', this.inputFile.file)

      this.pyhtonPdfService.sendPdf(formData).subscribe(() => { }, () => {
        loading.dismiss();
      })
    } else {
      const toast = await this.toastController.create({
        message: 'Por favor selecione um arquivo no formato PDF.',
        duration: 1500,
        position: 'bottom',
        color: 'danger'
      });

      await toast.present();
    }
  }

  onIonChange(ev: any) {
    this.speed = ev.detail.value / 2
  }

  pinFormatter(value: number) {
    return `${value}%`;
  }

  async confirm() {
    this.initializeRead = true
    const loading = await this.loadingCtrl.create({
      message: 'Preparando pdf...',
    });
    loading.present();
    setTimeout(() => {
      this.loadText()
      loading.dismiss();
    }, 2000)
  }

  loadText() {
    this.pyhtonPdfService.getTextByPdf().subscribe(({ result: text }) => {
      this.text = text
      this.textToShow = text
    })
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  readArray(index = 0) {
    if (index >= this.textOnArray.length) {
      return;
    }

    const arrayStr = [this.textOnArray[0], this.textOnArray[1], this.textOnArray[2]];
    const strToRead = arrayStr.join(' ');


    let indicesToDelete = [0, 1, 2];

    for (let i = indicesToDelete.length - 1; i >= 0; i--) {
      this.textOnArray.splice(indicesToDelete[i], 1);
    }

    this.textAlreadyRead = this.textAlreadyRead.concat(arrayStr)

    const readNow = strToRead
    this.textToShow = this.textAlreadyRead.join(' ') + " " + this.text.replace(readNow, `<span id="textReadNow" style=\'background-color:var(--ion-color-primary);color:white;padding:3px;border-radius:5px\;font-weight:600'>${readNow}</span>`)
    this.text = this.text.replace(strToRead, '')

    this.router.navigate([], { fragment: 'textReadNow' }).then(() => {
      const element = document.getElementById('textReadNow');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    this.textSpeak(strToRead)
      .then(() => {
        this.readIndex += 3
        this.getProgress()
        this.readArray(index + 3);
      })
  }

  getProgress() {
    this.readProgress = this.readIndex
  }

  onIonChangeRead(ev: any) {
    const indexToRead: number = ev.detail.value

    this.readArray(indexToRead)
    this.readIndex = indexToRead
  }

  jumpReadTo(jump: number, isPlus?: boolean) {
    if (isPlus) {
      const newIndex = this.readIndex + jump
      this.readIndex = newIndex
      this.readArray(newIndex)
    } else {
      const newIndex = this.readIndex - jump
      this.readIndex = newIndex
      this.readArray(newIndex)
    }
  }

  stop() {
    TextToSpeech.stop()
  }

  async textSpeak(text: string) {

    await TextToSpeech.speak({
      text: text,
      rate: this.speed,
      pitch: 1.0,
      lang: 'pt-BR',
      volume: 1.0,
      category: 'ambient',
    })
  }

}
