import { IconHome } from "@tabler/icons-react";
import clsx from "clsx";

export function Logo({ className, ...props }: { className?: string }) {
	return (
		<div className="flex items-center gap-1">
			{/*
			<svg
				aria-hidden="true"
				className={clsx("flex text-slate-900 dark:text-white", className)}
				width={32}
				height={31}
				{...props}
			>
				<image
					xlinkHref="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAfCAMAAACxiD++AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAk1BMVEUAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgAaYgceJJknqzN1dN4qbSrw8bb3djj4ds1hZzV2dbf39qcu8HD0M/i4duLsru3ystNkqT///9fsR4KAAAAH3RSTlMAKmSXweL4SZrmL5LyU8Rh3ljgOMsBnVeqOnSmz+39eqYUWwAAAAFiS0dEMK7cLeQAAAAHdElNRQfoCRQVNjEmh2EiAAABFUlEQVQoz4VTV7KDMAxUGum9kO4CDiK8hPvf7uFg3EjG+8GAd5GllQSg0en2+oMoGvR73Q60MRyNicZ4NPToyXRGHMymE5ufL0gLi7nhlyvyBatlw6835Cs265rf7sgP7LaS3x/sMyofjKuvw74SxIphLEm5eGRSgI0+rgRH9c55mj+zTwwjOAKcIhMfmfxdWILoBGfiC9ASkDNc1FuBiH8CUbiCC1yt9PNEJusIrnAzN7we+cu/4gZ3Y4EQrHh7grsVgSfIqEj8CE0OpChkFZT4OegqBK3LpKVbhfIhS6nywbG68qHlpCOonNS90AKG+dvqRdNNiWdZ97XUJ3FrHlx85iE4UeGZDE91eC/CmxXezd/b/Q8tvV+YZX0lgAAAAABJRU5ErkJggg=="
					width={32}
					height={31}
				/>
			</svg>

			<svg
				aria-hidden="true"
				className={clsx(
					"text-slate-900 dark:text-white hidden md:block",
					className,
				)}
				width={98}
				height={29}
				{...props}
			>
				<image
					width="98px"
					height="29px"
					xlinkHref="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGIAAAAdCAMAAABmD0koAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAZlBMVEX///+tv7utv7utv7utv7utv7utv7utv7utv7utv7utv7utv7utv7utv7utv7utv7tJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEhJSEitv7tJSEj///+WS1n9AAAAH3RSTlMAEFCAILBA0ODAcKAw8JBgIDAQQO+fr3BQ34C/YI/PstFk2wAAAAFiS0dEAIgFHUgAAAAHdElNRQfoCRYUJhiFPEmjAAAC2klEQVRIx62V6ZaqMAyAg2WxgAhtKVBE+/5POUlKHRe8Z+Tc/JBGknxkA4ANSQ4iAUgFHbOcJYn3RLjkeTA8wC7JiuMBMLSkiKIUlRSi5jtpARLWU1nK26nZiQAKLhmRnJIaifK8piAiAiHBbpfUsjjJQ0BkN5BNWZ1voYBHKU9SSgHp8QwZ2clyH0Qc65BFUyFCZLIJiAzjxUJVaZ2XRZ6n++p0OhY5I2q4QdZImVWcXpXmOUbN10KlZVHvLNTxIJM0FApO0BTynEe4EEccAD5mKR6zZheirCn4IWWEPFdZ8Xg3dhgfQTyoX1eKHNOGEXAopDyn2OokoQUpwpaUEnKsXpp9Fbjt6FdpLBU6plLSzMuiqiFvcHCw9iJKDSW2+YxNwpXU7K1VjNPpT4TO+B4v1g/fpdyzW+8NPyGMk/f2g6nz3uNl9u47xOxn/EVn9hvxwMx/ZLETEbPAHC4fCwWthv0I0C0/p/fLHzz2IYJo7/UfPP47QvULdP2MhRydCgg12Lm/3C3Gfp4HFW3bJWpPCOVGLLXrsdeO40CHhku7cgfPFQwzgR6GpsJPYQjVlTVzCbZL0LpXhKNxtD4IxenDcQluKJRFRGD0xdk1DhGsWyYuANtahybzJmJYESMTrs5dOSa5hczuCEuqNqur0YE0sy1rljfoHfHbC6oNcC5GkbL2NyJMqDQ6YRrGW03CUdGWWzQ+NnUTYf3Ebo50/FM9I9bdbOlBOn+XkMX73GwizN0tZAHPCPeg493rzNKrbxDYz+BmO9hA/GbhXub8G4R7d/vQi7tt91UW931s2y2Ep5rQW3HivoUduJD2glho1LcRwzoYGKXdQqx7QUlQv43TI465eUUM/N82QuEi9VovhqK8I65hHEyoxWUdDtM9ITpGTJ8Q0E3rRGEyysa3r+Wg3aLUgJNwie+htkfr68Lqsn4RHV1VT+MCeh7p1/CnTtn4xVO02lOPFj+ztFvQ3iGPbAAAAABJRU5ErkJggg=="
				/>
			</svg>
			*/}
			<IconHome className="w-6 h-6" />
		</div>
	);
}
