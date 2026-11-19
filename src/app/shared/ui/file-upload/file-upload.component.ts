import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  standalone: false
})
export class FileUploadComponent {
  @Input() accept = 'application/pdf';
  @Input() maxSizeMb = 10;
  @Input() label = 'Déposer un fichier';
  @Output() fileSelected = new EventEmitter<File>();
  @Output() validationError = new EventEmitter<string>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  dragOver = false;
  selectedFile: File | null = null;

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files.item(0);
    if (file) {
      this.processFile(file);
    }
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (file) {
      this.processFile(file);
    }
    input.value = '';
  }

  validate(file: File): string | null {
    const acceptedTypes = this.accept.split(',').map((type) => type.trim()).filter(Boolean);
    const matchesType = acceptedTypes.length === 0 || acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!matchesType) {
      return `Type de fichier non accepté. Formats acceptés : ${this.accept}.`;
    }

    if (file.size > this.maxSizeMb * 1024 * 1024) {
      return `Le fichier dépasse la taille maximale de ${this.maxSizeMb} Mo.`;
    }

    return null;
  }

  processFile(file: File): void {
    const error = this.validate(file);
    if (error) {
      this.validationError.emit(error);
      return;
    }
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  get formattedSize(): string {
    const size = this.selectedFile?.size ?? 0;
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} Ko`
      : `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }
}
