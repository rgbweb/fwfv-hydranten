import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';
import { FormsModule } from '@angular/forms';
import { MapComponent } from './components/map/map.component';
import { HydrantDialogComponent } from './components/hydrant-dialog/hydrant-dialog.component';

@NgModule({
  declarations: [AppComponent, MapComponent, HydrantDialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    LeafletModule,
    NgxLeafletLocateModule,
    ModalModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
