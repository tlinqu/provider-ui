import {Component, OnInit} from "@angular/core";
import {ConsentService} from "../shared/consent.service";
import {Consent} from "../shared/consent.model";
import {UtilityService} from "../../shared/utility.service";

@Component({
  selector: 'c2s-consent-terms',
  templateUrl: './consent-terms.component.html',
  styleUrls: ['./consent-terms.component.scss']
})
export class ConsentTermsComponent implements OnInit {
  public startDate: Date;
  public endDate: Date;
  public today: Date = new Date();
  public isOpenOnFocus: boolean = true;
  public FORMAT: string = "MM/dd/y";
  public isStartDatePastDate: boolean = false;
  public isEndDatePastDate: boolean = false;
  public isStartDateAfterEndDate: boolean = false;
  private patientConsent: Consent;

  constructor(private consentService: ConsentService,
              private utilityService: UtilityService) {
    this.consentService.getConsentEmitter().subscribe((consent) => {
      if (consent) {
        this.patientConsent = consent;
      }
    });
  }

  ngOnInit() {
    if (this.patientConsent.id != null) {
      //Consent Edit Mode
      this.startDate = this.patientConsent.startDate;
      this.endDate = this.patientConsent.endDate;
      if (this.startDate[0] < this.today.getFullYear()) {
        this.patientConsent.startDate = null;
        this.isStartDatePastDate = true;
      } else if (this.startDate[1] < (this.today.getMonth() + 1)) {
        this.patientConsent.startDate = null;
        this.isStartDatePastDate = true;
      } else if (this.startDate[2] < this.today.getDate()) {
        this.patientConsent.startDate = null;
        this.isStartDatePastDate = true;
      }
    } else {
      // Consent Create Mode
      this.startDate = new Date();
      this.endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
      this.patientConsent.startDate = this.startDate;
      this.patientConsent.endDate = this.endDate;
    }
  }

  public onStartDateChanged() {
    this.startDate = new Date(this.startDate);
    this.endDate = new Date(this.endDate);
    this.isStartDatePastDate = this.utilityService.isPastDate(this.startDate);
    this.isStartDateAfterEndDate = !(this.utilityService.isFirstDateBeforeSecondDate(this.startDate, this.endDate));

    if (this.isConsentTermsValid(this.startDate, this.endDate)) {
      this.patientConsent.startDate = this.startDate;
      this.patientConsent.endDate = this.endDate;
      this.consentService.setConsentEmitter(this.patientConsent);
    } else {
      this.patientConsent.startDate = null;
      this.consentService.setConsentEmitter(this.patientConsent);
    }
  }

  public onEndDateChanged() {
    this.startDate = new Date(this.startDate);
    this.endDate = new Date(this.endDate);
    this.isEndDatePastDate = this.utilityService.isPastDate(this.endDate);
    this.isStartDateAfterEndDate = !(this.utilityService.isFirstDateBeforeSecondDate(this.startDate, this.endDate));
    if (this.isConsentTermsValid(this.startDate, this.endDate)) {
      this.patientConsent.startDate = this.startDate;
      this.patientConsent.endDate = this.endDate;
      this.consentService.setConsentEmitter(this.patientConsent);
    } else {
      this.patientConsent.endDate = null;
      this.consentService.setConsentEmitter(this.patientConsent);
    }
  }

  private isConsentTermsValid(startDate: Date, endDate: Date): boolean {
    return !(this.utilityService.isPastDate(startDate))
      && !(this.utilityService.isPastDate(endDate))
      && this.utilityService.isFirstDateBeforeSecondDate(startDate, endDate);
  }
}
