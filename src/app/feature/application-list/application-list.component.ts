import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ROLE_FIELDS_MAP } from '../../shared/role-fields';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataStorageService } from '../../core/services/data-storage.service';
import { ROLE_DATA_MAP } from '../../shared/application-data';

interface NavigationState {
  role?: string;
  data?: any[];
}

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [NgFor, HeaderComponent, FormsModule],
  templateUrl: './application-list.component.html',
  styleUrl: './application-list.component.css'
})
export class ApplicationListComponent implements OnInit {

  role: string = '';
  fields: string[] = [];
  data: any[] = [];
  searchText: string = '';

  constructor(private router: Router,
    private http: HttpClient,
    private dataService: DataStorageService
  ) { }

  ngOnInit() {
    // this.role = history.state.role;
    // this.data = history.state.data;
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || {} as NavigationState;
    this.role = state.role || '';
    this.data = state.data || [];
    this.fetchApplicationList(localStorage.getItem("userId") || '');
    this.fields = ROLE_FIELDS_MAP[this.role];
  }

  fetchApplicationList(userId: string) {
    //filters, sort should come from ui
    const filters = [
      {
        columnName: "userId",
        value: userId,
        type: "EQUALS"
      }
    ];
    const sort = [
      {
        sortField: "crDTimes",
        sortType: "DESC"
      }
    ];
    const pagination = {
      pageStart: 0,
      pageFetch: 10
    };
    this.dataService
      .fetchApplicationList(userId, filters, sort, pagination)
      .subscribe(
        (appResponse: any) => {
          console.log("Application List Response:", appResponse);
          if (appResponse && appResponse.response && appResponse.response.data) {
            const applicationData = appResponse.response.data;

            // Process the response data and show in the ui table
            applicationData.forEach((application: any) => {
              console.log("Application ID:", application.applicationId);
              console.log("Service:", application.service);
              console.log("Status:", application.status);
            });

          } else if (appResponse.errors && appResponse.errors.length) {
            console.error("API Errors:", appResponse.errors);
          }
        },
        (appError) => {
          console.error("Error fetching application list:", appError);
        }
      );
  }


  get filteredRows() {
    if (!this.searchText.trim()) {
      return this.data; // Show full list if searchText is empty
    }
    return this.data.filter(row =>
      row['Application ID']?.toString().toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  onRowClick(rowData: any) {
    // get application details api
    const applicationId = rowData['Application ID'];
    this.dataService
      .getApplicationDetails(applicationId)
      .subscribe(
        (response: any) => {
          // Navigate to the details page with fetched data
          this.router.navigate(['/application-detail'], { state: { role: this.role, data: response.response } });
        },
        (error) => {
          console.error('Error fetching application details:', error);
          alert('Failed to fetch application details.');
        });
  }
}
