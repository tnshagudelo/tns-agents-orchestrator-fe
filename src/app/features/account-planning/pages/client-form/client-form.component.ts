import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClientService } from '../../services/client.service';
import { CreateClientRequest } from '../../models/account-planning.model';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, TranslatePipe,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  isEdit = false;
  clientId = '';

  form: CreateClientRequest = {
    name: '',
    industry: '',
    country: '',
    website: '',
    description: '',
    linkedInUrl: '',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.clientId = id;
      this.clientService.getById(id).subscribe(c => {
        this.form = {
          name: c.name,
          industry: c.industry,
          country: c.country,
          website: c.website ?? '',
          description: c.description ?? '',
          linkedInUrl: c.linkedInUrl ?? '',
        };
        this.cdr.markForCheck();
      });
    }
  }

  save(): void {
    if (this.isEdit) {
      this.clientService.update(this.clientId, this.form).subscribe(() => {
        this.router.navigate(['/account-planning']);
      });
    } else {
      this.clientService.create(this.form).subscribe(() => {
        this.router.navigate(['/account-planning']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/account-planning']);
  }
}
