import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-ebay';
  formGroup: FormGroup;
  constructor(private formBuilder: FormBuilder, private httpClient: HttpClient) {
    this.formGroup = formBuilder.group({ search: formBuilder.control(null) });
    this.formGroup.get('search').statusChanges.subscribe(() => {
      this.queryItems();
    });
  }

  onClick() {
    this.formGroup.get('search').setValue(1);
  }

  queryItems() {
    const param = this.formGroup.get('search').value;
    console.log(param);
    this.httpClient.get(`/query?${new URLSearchParams(param).toString()}`).subscribe((data)=> {
      console.log(data);
    });
  }
}
