import {
	PLAN_PREMIUM,
	PLAN_JETPACK_SECURITY_DAILY,
	WPCOM_FEATURES_WORDADS,
	FEATURE_WORDADS_INSTANT,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import wordAdsImage from 'calypso/assets/images/illustrations/dotcom-wordads.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import ActionCard from 'calypso/components/action-card';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySites from 'calypso/components/data/query-sites';
import QueryWordadsStatus from 'calypso/components/data/query-wordads-status';
import EmptyContent from 'calypso/components/empty-content';
import FeatureExample from 'calypso/components/feature-example';
import FormButton from 'calypso/components/forms/form-button';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { WordAdsStatus } from 'calypso/my-sites/earn/ads/types';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSiteWordadsStatus from 'calypso/state/selectors/get-site-wordads-status';
import siteHasWordAds from 'calypso/state/selectors/site-has-wordads';
import { canAccessWordAds, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { requestWordAdsApproval, dismissWordAdsError } from 'calypso/state/wordads/approve/actions';
import {
	isRequestingWordAdsApprovalForSite,
	getWordAdsErrorForSite,
	getWordAdsSuccessForSite,
} from 'calypso/state/wordads/approve/selectors';
import { wordadsUnsafeValues } from 'calypso/state/wordads/status/schema';
import { isSiteWordadsUnsafe } from 'calypso/state/wordads/status/selectors';

import './style.scss';
import 'calypso/my-sites/stats/stats-module/style.scss';

class AdsWrapper extends Component {
	static propTypes = {
		adsProgramName: PropTypes.string,
		isUnsafe: PropTypes.oneOf( wordadsUnsafeValues ),
		requestingWordAdsApproval: PropTypes.bool.isRequired,
		requestWordAdsApproval: PropTypes.func.isRequired,
		section: PropTypes.string.isRequired,
		site: PropTypes.object,
		wordAdsError: PropTypes.string,
		wordAdsSuccess: PropTypes.bool,
	};

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	renderInstantActivationToggle( component ) {
		const { translate, adsProgramName } = this.props;

		return (
			<div>
				{ this.props.wordAdsError && (
					<Notice
						classname="ads__activate-notice"
						status="is-error"
						onDismissClick={ this.handleDismissWordAdsError }
					>
						{ this.props.wordAdsError }
					</Notice>
				) }
				{ this.props.isUnsafe === 'mature' && (
					<Notice
						classname="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your site has been identified as serving mature content. ' +
								'Our advertisers would like to include only family-friendly sites in the program.'
						) }
					>
						<NoticeAction
							href="https://wordads.co/2012/09/06/wordads-is-for-family-safe-sites/"
							external={ true }
						>
							{ translate( 'Learn more' ) }
						</NoticeAction>
					</Notice>
				) }
				{ this.props.isUnsafe === 'spam' && (
					<Notice
						classname="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your site has been identified as serving automatically created or copied content. ' +
								'We cannot serve WordAds on these kind of sites.'
						) }
					/>
				) }
				{ this.props.isUnsafe === 'private' && (
					<Notice
						classname="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your site is marked as private. It needs to be public so that visitors can see the ads.'
						) }
					>
						<NoticeAction href={ '/settings/general/' + this.props.siteSlug }>
							{ translate( 'Change privacy settings' ) }
						</NoticeAction>
					</Notice>
				) }
				{ this.props.isUnsafe === 'other' && (
					<Notice
						classname="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Your site cannot participate in the WordAds program.' ) }
					/>
				) }

				<Card className="ads__activate-wrapper">
					<div className="ads__activate-header">
						<h2 className="ads__activate-header-title">{ translate( 'Apply to Join WordAds' ) }</h2>
						<div className="ads__activate-header-toggle">
							<FormButton
								disabled={
									this.props.site.options.wordads ||
									( this.props.requestingWordAdsApproval && this.props.wordAdsError === null ) ||
									this.props.isUnsafe !== false
								}
								onClick={ this.props.requestWordAdsApproval }
							>
								{ translate( 'Join WordAds' ) }
							</FormButton>
						</div>
					</div>
					<ActionCard
						headerText={ translate( 'Start Earning Income from Your Site' ) }
						mainText={ translate(
							'WordAds is the leading advertising optimization platform for WordPress sites, ' +
								'where the internet’s top ad suppliers bid against each other to deliver their ads to your site, maximizing your revenue.' +
								'{{br/}}{{br/}}{{em}}Because you have a paid plan, you can skip the review process and activate %(program)s instantly.{{/em}}' +
								'{{br/}}{{br/}}{{a}}Learn more about the program{{/a}}',
							{
								args: { program: adsProgramName },
								components: {
									a: <a href="http://wordads.co" target="_blank" rel="noopener noreferrer" />,
									em: <em />,
									br: <br />,
								},
							}
						) }
						buttonText={ translate( 'Learn More on WordAds.co' ) }
						buttonIcon="external"
						buttonPrimary={ false }
						buttonHref="https://wordads.co"
						buttonTarget="_blank"
					>
						<img src={ wordAdsImage } width="170" height="143" alt="WordPress logo" />
					</ActionCard>
				</Card>
				<FeatureExample>{ component }</FeatureExample>
			</div>
		);
	}

	renderEmptyContent() {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ this.props.translate( 'You are not authorized to view this page' ) }
			/>
		);
	}

	renderOwnerRequiredMessage() {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/wordAds.svg"
				illustrationWidth={ 400 }
				title={ this.props.translate( 'Only site owners are eligible to activate WordAds.' ) }
			/>
		);
	}

	renderUpsell( options = {} ) {
		const { forceDisplay = false, url } = options;
		const { siteSlug, translate } = this.props;
		const bannerURL = url || `/checkout/${ siteSlug }/premium`;
		return (
			<UpsellNudge
				forceDisplay={ forceDisplay }
				callToAction={ translate( 'Upgrade' ) }
				plan={ PLAN_PREMIUM }
				title={ translate( 'Upgrade to the Premium plan and start earning' ) }
				description={ translate(
					"By upgrading to the Premium plan, you'll be able to monetize your site through the WordAds program."
				) }
				feature={ WPCOM_FEATURES_WORDADS }
				href={ bannerURL }
				showIcon
				event="calypso_upgrade_nudge_impression"
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksImpressionProperties={ { cta_name: undefined, cta_size: 'regular' } }
				tracksClickName="calypso_upgrade_nudge_cta_click"
				tracksClickProperties={ { cta_name: undefined, cta_size: 'regular' } }
				list={ [
					translate( 'Instantly enroll into the WordAds network.' ),
					translate( 'Earn money from your content and traffic.' ),
				] }
			/>
		);
	}

	renderjetpackUpsell() {
		const { siteSlug, translate } = this.props;
		const bannerURL = `/checkout/${ siteSlug }/${ PLAN_JETPACK_SECURITY_DAILY }`;
		return (
			<UpsellNudge
				callToAction={ translate( 'Upgrade' ) }
				plan={ PLAN_JETPACK_SECURITY_DAILY }
				title={ translate( 'Upgrade and start earning' ) }
				description={ translate(
					'Make money each time someone visits your site by displaying ads on all your posts and pages.'
				) }
				href={ bannerURL }
				feature={ WPCOM_FEATURES_WORDADS }
				showIcon
				event="calypso_upgrade_nudge_impression"
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksClickName="calypso_upgrade_nudge_click"
			/>
		);
	}

	renderNoticeSiteIsPrivate() {
		const { translate, siteSlug } = this.props;
		const privacySettingPageLink = `https://wordpress.com/settings/general/${ siteSlug }#site-privacy-settings`;
		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate(
					"No ads are displayed on your site because your site's {{link}}privacy setting{{/link}} is set to private.",
					{
						components: {
							link: <a href={ privacySettingPageLink } />,
						},
					}
				) }
			</Notice>
		);
	}

	renderContentWithUpsell( component ) {
		const { translate, section, siteSlug } = this.props;
		const allowedSections = [ 'ads-earnings', 'ads-payments' ];
		const isAllowedSection = allowedSections.includes( section );
		const url = `/plans/${ siteSlug }?feature=${ FEATURE_WORDADS_INSTANT }&plan=${ PLAN_PREMIUM }`;
		return (
			<>
				<UpsellNudge
					forceDisplay={ true }
					callToAction={ translate( 'Upgrade' ) }
					plan={ PLAN_PREMIUM }
					title={ translate( 'Upgrade to the Premium plan to continue earning' ) }
					description={ translate(
						'WordAds is disabled for this site because it does not have an eligible plan. You are no longer earning ad revenue, but you can view your earning and payment history. To restore access to WordAds please upgrade to an eligible plan.'
					) }
					feature={ WPCOM_FEATURES_WORDADS }
					href={ url }
					showIcon
					event="calypso_upgrade_nudge_impression"
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksImpressionProperties={ { cta_name: undefined, cta_size: 'regular' } }
					tracksClickName="calypso_upgrade_nudge_cta_click"
					tracksClickProperties={ { cta_name: undefined, cta_size: 'regular' } }
				/>
				{ isAllowedSection ? component : <FeatureExample>{ component }</FeatureExample> }
			</>
		);
	}

	render() {
		const {
			canAccessAds,
			canActivateWordadsInstant,
			canUpgradeToUseWordAds,
			isEnrolledWithIneligiblePlan,
			isWordadsInstantEligibleButNotOwner,
			site,
			siteId,
			translate,
		} = this.props;

		let component = this.props.children;
		let notice = null;

		if ( this.props.requestingWordAdsApproval || this.props.wordAdsSuccess ) {
			notice = (
				<Notice status="is-success" showDismiss={ false }>
					{ translate( 'You have joined the WordAds program. Please review these settings:' ) }
				</Notice>
			);
		} else if ( canActivateWordadsInstant ) {
			component = this.renderInstantActivationToggle( component );
		} else if ( isWordadsInstantEligibleButNotOwner ) {
			component = this.renderOwnerRequiredMessage( component );
		} else if ( canUpgradeToUseWordAds && site.jetpack ) {
			component = this.renderjetpackUpsell();
		} else if ( canUpgradeToUseWordAds ) {
			component = this.renderUpsell();
		} else if ( ! canAccessAds ) {
			component = this.renderEmptyContent();
		} else if ( ! site.options.wordads && ! ( site.jetpack && canUpgradeToUseWordAds ) ) {
			component = null;
		} else if ( site.options.wordads && site.is_private ) {
			notice = this.renderNoticeSiteIsPrivate();
		} else if ( isEnrolledWithIneligiblePlan ) {
			component = this.renderContentWithUpsell( component );
		}

		return (
			<div>
				<QuerySites siteId={ siteId } />
				<QuerySiteFeatures siteIds={ [ siteId ] } />
				<QueryWordadsStatus siteId={ siteId } />
				{ notice }
				{ component }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const hasWordAdsFeature = siteHasWordAds( state, siteId );
	const canActivateWordAds = canCurrentUser( state, siteId, 'activate_wordads' );

	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		canAccessAds: canAccessWordAds( state, siteId ),
		canActivateWordadsInstant: ! site.options.wordads && canActivateWordAds && hasWordAdsFeature,
		canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		canUpgradeToUseWordAds: ! site.options.wordads && ! hasWordAdsFeature,
		hasWordAdsFeature,
		isEnrolledWithIneligiblePlan:
			site?.options?.wordads &&
			! hasWordAdsFeature &&
			getSiteWordadsStatus( state, siteId ) === WordAdsStatus.ineligible,
		requestingWordAdsApproval: isRequestingWordAdsApprovalForSite( state, site ),
		wordAdsError: getWordAdsErrorForSite( state, site ),
		wordAdsSuccess: getWordAdsSuccessForSite( state, site ),
		isUnsafe: isSiteWordadsUnsafe( state, siteId ),
		isWordadsInstantEligibleButNotOwner:
			! site.options.wordads && hasWordAdsFeature && ! canActivateWordAds,
		adsProgramName: isJetpackSite( state, siteId ) ? 'Ads' : 'WordAds',
	};
};

const mapDispatchToProps = {
	requestWordAdsApproval,
	dismissWordAdsError,
};

const mergeProps = ( stateProps, dispatchProps, parentProps ) => ( {
	...dispatchProps,
	requestWordAdsApproval: () =>
		! stateProps.requestingWordAdsApproval
			? dispatchProps.requestWordAdsApproval( stateProps.siteId )
			: null,
	...parentProps,
	...stateProps,
} );

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( localize( AdsWrapper ) );
