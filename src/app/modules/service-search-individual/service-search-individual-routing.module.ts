import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ErrorPageComponent} from '@app/shared/components/error-page/error-page.component';
import {SearchServiceIndividualComponent} from '@modules/service-search-individual/search-service-individual/search-service-individual.component';

const routes: Routes = [
  {path: ':defaultCaseType', component: SearchServiceIndividualComponent},
  {path: '**', component: ErrorPageComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceSearchIndividualRoutingModule {
}
