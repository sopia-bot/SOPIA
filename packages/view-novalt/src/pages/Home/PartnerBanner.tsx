import { ApiLivesInfo, HttpRequest, Live, User } from "@sopia-bot/core"
import { Button } from "primereact/button";
import { Galleria } from "primereact/galleria"
import { useTranslation } from "react-i18next"

function BannerItem(item: Live) {
	const { t } = useTranslation();
	return <div style={{
		width: '100vw',
		height: '400px',
	}}>
		<div style={{
			backgroundImage: `url(${item.img_url})`,
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			zIndex: 0,
			top: '-5px',
			left: '-5px',
			filter: 'blur(5px)',
			position: 'absolute',
			width: 'calc(100vw + 15px)',
			height: 'calc(400px + 15px)',
		}}>
		</div>
		<div style={{
			backgroundImage: `url(${item.img_url})`,
			width: '100vw',
			height: '415px',
			zIndex: 1,
			position: 'absolute',
			backgroundSize: 'contain',
			backgroundRepeat: 'no-repeat',
			backgroundPositionX: 'right',
		}}>
			<div style={{
				width: '100vw',
				height: '415px',
				backgroundColor: 'rgba(0, 0, 0, 0.3)',
			}} className="flex align-items-center">
				<div className="flex ml-4 flex-column">
					<h3 className="text-white my-1">{t('home.partner.title')}</h3>
					<h1 className="my-1 text-pink-100">
						{item.title}
						<span className="text-white text-base font-normal ml-2">({item.author.nickname})</span>
					</h1>
					<Button className="mt-2 p-button-text text-white" style={{ width: '200px' }} label={t('home.partner.join')||'join'} />
				</div>
			</div>
		</div>
	</div>
}

function ThumbnailItem(item: Live) {
	return <div>
		<div style={{
			width: '100px',
			height: '100px',
			backgroundImage: `url(${item.img_url})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center',
		}}></div>
	</div>
}

interface PartnerBannerProps {
	lives: Live[];
}
export default function PartnerBanner(props: PartnerBannerProps) {

	return <Galleria
		value={props.lives}
		className='sopia'
		numVisible={5}
		style={{ width: '100vw', maxHeight: '600px' }}
		item={BannerItem}
		thumbnail={ThumbnailItem} />
}