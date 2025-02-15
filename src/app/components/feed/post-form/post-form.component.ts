import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Post } from 'src/app/models/post.model';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage/';
import { AngularFireAuth } from '@angular/fire/auth';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css'],
})
export class PostFormComponent {
  post: any = {};
  user: any | null;
  createdDate = new Date().toISOString();

  url: any;
  basePath = '/images';
  downloadableURL = '';
  task: AngularFireUploadTask | undefined;
  progressValue: Observable<number> | undefined;

  constructor(
    public activeModal: NgbActiveModal,
    private fireStorage: AngularFireStorage,
    public afAuth: AngularFireAuth,
    private postService: PostService
  ) {
    afAuth.authState.subscribe((user) => {
      this.user = user;
    });
  }

  publishPost(form: Post) {
    let post = {
      ...form,
      userId: this.user.uid,
      createdDate: this.createdDate,
      imageURL: this.downloadableURL,
    };

    this.postService.addPost(post).subscribe(
      (res) => {
        console.log(res);
        this.activeModal.close();
      },
      (err) => {
        console.error(err);
      }
    );
  }

  imgPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.url = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);

      //Image Upload
      this.firestoreImageUpload(event);
    }
  }

  async firestoreImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `${this.basePath}/${file.name}`;
      this.task = this.fireStorage.upload(filePath, file);

      this.progressValue = this.task.percentageChanges() as Observable<number>;

      (await this.task).ref.getDownloadURL().then((url: string) => {
        this.downloadableURL = url;
      });
    } else {
      //this.toastr.error('No images selected..!');
      this.downloadableURL = '';
    }
  }
}
